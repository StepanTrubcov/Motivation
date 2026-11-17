import { Check } from 'lucide-react';
import styles from './GoalStatusIcon.module.css';

export default function GoalStatusIcon({ completed = false }) {
  return (
    <span className={`${styles.circle} ${completed ? styles.completed : ''}`} aria-hidden="true">
      <Check size={32} strokeWidth={2.8} />
    </span>
  );
}
