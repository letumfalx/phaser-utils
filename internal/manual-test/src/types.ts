export type CustomServerEmitEvents = {
  sent_to_client: (first: number, second: string, third: boolean) => void;
};

export type CustomClientEmitEvents = {
  sent_to_server: (first: boolean, second: number, third: string) => void;
};
