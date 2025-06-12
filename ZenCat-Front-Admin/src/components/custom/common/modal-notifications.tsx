import { SuccessModal } from './success-modal';
import { ErrorModal } from './error-modal';
import { InfoModal } from './info-modal';
import { useModalNotifications, ModalType } from '@/hooks/use-modal-notifications';

interface ModalNotificationsProps {
  modal: {
    isOpen: boolean;
    type: ModalType;
    title: string;
    description: string;
  };
  onClose: () => void;
}

export function ModalNotifications({ modal, onClose }: ModalNotificationsProps) {
  const { isOpen, type, title, description } = modal;

  switch (type) {
    case 'success':
      return (
        <SuccessModal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          description={description}
        />
      );
    case 'error':
      return (
        <ErrorModal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          description={description}
        />
      );
    case 'info':
      return (
        <InfoModal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          description={description}
        />
      );
    default:
      return null;
  }
} 