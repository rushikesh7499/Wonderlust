module.exports = (fx) =>{
    return function (req,res,next){
        fx(req,res,next).catch(next);
    };
};