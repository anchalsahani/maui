interface InputProps {
  type?: string;
  placeholder: string;
}

export default function Input({
  type = "text",
  placeholder,
}: InputProps) {
  return <input className="input" type={type} placeholder={placeholder} />;
}