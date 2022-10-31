export const EventInfo = ({
  eventName,
  eventDescription,
}: {
  eventName: string;
  eventDescription: string;
}) => {
  return (
    <div className="mt-4 ">
      <div className="font-bold text-m">{eventName}</div>
      <div className="text-xs">{eventDescription}</div>
    </div>
  );
};
