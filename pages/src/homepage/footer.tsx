import "../css/home/footer.scss";

const Footer = () =>{
    return (
        <div className="footer-container">
            <div className="footer-container-top">
                <table>
                    <thead>
                        <tr>
                            <th className="text-blue"><span className="lucide--link"></span> Quick Links</th>
                        </tr>
                        <tr>
                            <td><a href="#">Latest Event</a></td>
                            <td><a href="#">Terms and Conditions</a></td>
                        </tr>
                        <tr>
                            <td><a href="#">Privacy policy</a></td>
                            <td><a href="#">Contact us</a></td>
                        </tr>
                    </thead>
                </table>
                <table>
                    <thead>
                        <tr>
                            <th className="text-blue"><span className="fa--address-book-o"></span> Contacts</th>
                        </tr>
                        <tr>
                            <td><span className="bi--envelope-at"></span> Bsoftlimited@gmail.com</td>
                            <td><span className="icon-park-outline--github"></span><a href="https://github.com/bsoftlimited"> Github.com/bsoftlimited</a></td>
                        </tr>
                        <tr>
                            <td><span className="uil--map-marker"></span> Back of Amarata Yenagoa Bayelsa State</td>
                            <td><span className="et--phone"></span> +234 708 795 2034</td>
                        </tr>
                    </thead>
                </table>
            </div>
            <div>
                <hr/>
                <p className="footer-company-name">All Rights Reserved. &copy; 2024 <a href="#">Bsoft Limited</a> &nbsp;&nbsp;&nbsp;&nbsp; Design By : <a href="https://html.design/">Okelekele Nobel Bobby</a></p>
            </div>
        </div>
    );
}

export default Footer;