import Button from "./ui/Button";

const ItemControls = ({ current, updateCurrent, originEmailBody }) => {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <Button
          current={current === "content"}
          onClick={() => updateCurrent("content")}
          variant="selectable"
          grouped
          first
        >
          Content
        </Button>
        {originEmailBody && (
          <Button
            current={current === "email"}
            onClick={() => updateCurrent("email")}
            variant="selectable"
            grouped
          >
            Email
          </Button>
        )}
        <Button
          current={current === "clips"}
          onClick={() => updateCurrent("clips")}
          variant="selectable"
          grouped
          last
        >
          Clips
        </Button>
      </div>
    </div>
  );
};

export default ItemControls;
