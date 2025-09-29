import './LoadingScreen.css'

const LoadingScreen = ({ title }) => (
    <div className="loading-wrapper">
        <div className="loading-box">
            <h2 className="loading-title">{title}</h2>
            <p className="loading-text">
                Если приложение не запускается попробуйте зайти чуть позже, когда
                нагрузка уменьшится.
            </p>
            <p className="loading-support">
                Чтобы приложение работало стабильнее, вы можете нас поддержать!
                <br />
                Информация о поддержке доступна в нашем Telegram-боте.
            </p>
        </div>
    </div>
);

export default LoadingScreen