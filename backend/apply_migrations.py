#!/usr/bin/env python3
"""
Simple SQL migrations runner that records applied migrations in the database.

Run: python backend/apply_migrations.py
"""
import os
import glob
from sqlalchemy import text
from database import engine

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), 'migrations')
TRACK_TABLE_SQL = '''
CREATE TABLE IF NOT EXISTS applied_migrations (
    id SERIAL PRIMARY KEY,
    filename TEXT UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
'''


def get_migration_files():
    files = sorted(glob.glob(os.path.join(MIGRATIONS_DIR, '*.sql')))
    return files


def already_applied(conn, filename):
    result = conn.execute(text("SELECT 1 FROM applied_migrations WHERE filename = :fn"), {"fn": filename})
    return result.first() is not None


def mark_applied(conn, filename):
    conn.execute(text("INSERT INTO applied_migrations (filename) VALUES (:fn) ON CONFLICT DO NOTHING"), {"fn": filename})


def apply_migration(conn, filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        sql = f.read()
    conn.execute(text(sql))


def main():
    if not os.path.isdir(MIGRATIONS_DIR):
        print('No migrations directory found at', MIGRATIONS_DIR)
        return

    files = get_migration_files()
    if not files:
        print('No migration files found in', MIGRATIONS_DIR)
        return

    with engine.connect() as conn:
        # Ensure tracking table
        conn.execute(text(TRACK_TABLE_SQL))

        for fpath in files:
            fname = os.path.basename(fpath)
            if already_applied(conn, fname):
                print('Skipping already applied migration:', fname)
                continue

            print('Applying migration:', fname)
            try:
                apply_migration(conn, fpath)
                mark_applied(conn, fname)
                print('Applied', fname)
            except Exception as e:
                print('Failed to apply', fname, 'error:', e)
                print('Stopping further migrations')
                break


if __name__ == '__main__':
    main()
