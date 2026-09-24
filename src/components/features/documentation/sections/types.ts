export type Step = {
  title: string;
  content: string;
  tip?: string;
  warning?: string;
};

export type Section = {
  id: string;
  icon: string;
  title: string;
  description: string;
  steps: Step[];
};
