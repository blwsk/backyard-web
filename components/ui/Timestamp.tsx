const Timestamp = ({ ts }: { ts: number }) => {
  const date = new Date(ts);
  const dateString = date.toDateString();
  const timeString = date.toLocaleTimeString();

  return (
    <span>
      <span>{dateString}</span>
      <span>・</span>
      <span>{timeString}</span>
    </span>
  );
};

export default Timestamp;
