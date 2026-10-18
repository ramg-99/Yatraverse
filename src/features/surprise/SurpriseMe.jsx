import { Dices } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';

export function SurpriseMe() {
  const navigate = useNavigate();

  return (
    <Button variant="ghost" onClick={() => navigate('/cities')}>
      <Dices className="h-4 w-4" />
      Surprise me
    </Button>
  );
}

export default SurpriseMe;