module.exports = {
	mySQLDate: () => {
		let dt = new Date();
	    let mth = ((dt.getMonth() + 1) < 10 ? '0' : '') + (dt.getMonth() + 1);
	    return dt.getFullYear() + '-' + mth + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();    
	}
}