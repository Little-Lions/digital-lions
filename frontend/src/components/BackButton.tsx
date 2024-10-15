import { useRouter } from "next/navigation";
import CustomButton from "./CustomButton";

interface BackButtonProps {
  className?: string;
  closeMenu: () => void; 
}

const BackButton: React.FC<BackButtonProps> = ({ closeMenu }) => {
  const router = useRouter();

  const handleBackClick = () => {
    closeMenu(); 
    router.back(); 
  };

  return (
    <CustomButton
      label="← Back"
      variant="outline"
      onClick={handleBackClick}
      className="px-4 py-2 rounded bg-white"
    />
  );
};

export default BackButton;
