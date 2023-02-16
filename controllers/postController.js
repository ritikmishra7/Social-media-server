module.exports = async (req, res) => {
    console.log(req._id);
    return res.send("Here are all the posts");
}