function getDate(){
    let todaydate = new Date(Date.now()).toLocaleString().split(',')[0];
    document.getElementById("resvDate").innerHTML = todaydate;
}
