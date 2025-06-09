import { useId } from "react";

function Select({ options, label, className = "", ref, ...props }) {
  const id = useId();

  return (
    <div className="w-full">
      {label && <label htmlFor={id} className=""></label>}
      <select name="" id={id} ref={ref} {...props} className={`${className}`}>
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;
