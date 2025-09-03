import Submission from "../models/Submission";

function grade(text){
    const score =Math.min(100,text.length%101);
    return {score ,feedback:score>50?"Good work!" :"Needs improvements." };
}

