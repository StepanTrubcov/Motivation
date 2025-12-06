// import React, { useEffect, useState } from "react";
// import c from './BigReport.module.css'
// import { generateSavingGoalsReport } from "@/lib/api/Api";

// const BigReport = ({ timeSavingGoals, goals }) => {

//     const [text, setText] = useState(null)

//     const [loading, setLoading] = useState(true)

//     const number = [30, 5, 120]

//     for (let i = 0; i < number.length; i++) {
//         if (timeSavingGoals.length === number[i]) {

//             useEffect(async () => {
//               //const data = await generateSavingGoalsReport()
//               //console.log(data)
//             }, [])

//             return <div>
//                 <div className={c.name} >
//                     Большой отчёт за {timeSavingGoals.length} дней
//                 </div>
//                 {
//                     loading && <div >
//                         <img className={c.loading} src='https://usagif.com/wp-content/uploads/loading-96.gif' />
//                     </div> ||
//                     <div className={c.generatedBox}>
//                         <div className={c.previewWrapper}>
//                             <pre className={c.previewText}>
//                                 {text.split("\n").slice(0, 1).join("\n")}
//                                 {text.split("\n").length > 1 ? "\n..." : ""}
//                             </pre>
//                         </div>
//                     </div>
//                 }
//             </div>
//         }
//     }

// }

// export default BigReport;