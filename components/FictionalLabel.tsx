/** Every fictional athlete carries this label in or directly under the frame. It also covers the generated "before" photo. */
export function FictionalLabel({ className = "" }: { className?: string }) {
  return <span className={`fictional-label ${className}`.trim()}>Example — fictional athlete · photo and artwork generated</span>;
}
