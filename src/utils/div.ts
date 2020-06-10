export function toggleElement (event: React.ChangeEvent<{}>, value: string): void {
  const val = (event.target as HTMLInputElement).value;
  const element = document.getElementById(value);
  if (element != null) {
    if (val === "yes") {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  }
};