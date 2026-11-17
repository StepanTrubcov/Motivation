import { goalIconName } from '@/lib/goalIcons';
import styles from './GoalIcon.module.css';

export default function GoalIcon({ goal }) {
    return <span className={styles.tile} aria-hidden="true">
        <img className={styles.image} src={`/Image/goals-v1/${goalIconName(goal)}.webp`} alt="" width={32} height={32} decoding="async" />
    </span>;
}
