import c from './filter.module.css'

const filter = (goals = [], text, funct = () => { }, img = 'https://assets-global.website-files.com/620cd05594501a50fa9b7e10/620cd05594501a7b789b7f06_Button.png', home = true) => {
    const filteredGoals = goals.filter(g => g.status === text);
    if (filteredGoals.length === 0) {
        if (home) {
            return <div className={c.blok}>У вас нет таких целей</div>;
        }
    }
    return filteredGoals.map(d => (
        <div key={d.id} onClick={() => funct(d)} className={c.blok} >
            <div>
                <div className={c.title} >{d.title}</div>
                <div className={c.pts} >{d.points} pts</div>
            </div>
            <div>
                <img className={c.img} src={img} alt="button" />
            </div>
        </div>
    ));
}

export default filter