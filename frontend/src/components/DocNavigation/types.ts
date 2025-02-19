export interface NavLink {
  title: string;
  href: string;
}

export interface NavSection {
  header: string;
  href: string;
  links: NavLink[];
}
