type StatusType = 'error' | 'success' | 'info';

const classes: Record<StatusType, string> = {
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

export const StatusMessage = ({
  message,
  type = 'info',
}: {
  message: string;
  type?: StatusType;
}) => <div className={`rounded-md border px-3 py-2 text-sm ${classes[type]}`}>{message}</div>;
