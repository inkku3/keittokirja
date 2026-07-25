interface TitleHeaderProps {
  title?: string;
}

export function TitleHeader({ title = 'KEITTOKIRJA' }: TitleHeaderProps) {
  return <div className="main-header">{title}</div>;
}
