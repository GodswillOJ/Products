const isLogin = async(req, res, next) =>{
        try {
            if (req.session.user_id) return next() 
    
            else {
                return res.redirect('/user/login');
            }
        } catch (error) {
            console.log(error.message);
        }
}


const isLogout = async(req, res, next) =>{
            try {
                if (req.session.user_id) {
                    res.redirect('/');
                } next() 
            } catch (error) {
                console.log(error.message);
            }
}


// admin

const isAdminLogin = async(req, res, next) =>{
    try {
        if (req.session.user_id) return next() 

        else {
            return res.redirect('/admin/login');
        }
    } catch (error) {
        console.log(error.message);
    }
}


const isAdminLogout = async(req, res, next) =>{
        try {
            if (req.session.user_id) {
                res.redirect('/');
            } next() 
        } catch (error) {
            console.log(error.message);
        }
}

module.exports = {
    isAdminLogin,
    isAdminLogout,
    isLogin,
    isLogout
}