export type ApiResponse<TItems = unknown, TMeta extends object = {}> = {
  message: string;
  items?: TItems;
} & TMeta;
