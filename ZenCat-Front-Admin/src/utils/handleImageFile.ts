export function handleImageFile(
  event: React.ChangeEvent<HTMLInputElement>,
  setImagePreview: (url: string) => void,
  setImageFile: (file: File) => void
) {
  const file = event.target.files?.[0];
  if (!file) return;

  setImageFile(file);

  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result as string);
  };
  reader.readAsDataURL(file);
}
