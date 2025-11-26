// components/Footer.tsx - SEO Enhanced
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground py-8" role="contentinfo">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">
              Copy<span className="text-primary">Express</span> Claremont
            </h3>
            <p className="text-secondary-foreground/80">Your trusted printing partner in Cape Town</p>
            <address className="text-secondary-foreground/80 mt-2 not-italic">
              Claremont, Cape Town, Western Cape
            </address>
          </div>
          
          <div className="text-center md:text-right text-secondary-foreground/80">
            <p>&copy; {currentYear} CopyExpress Claremont. All rights reserved.</p>
            <p className="text-sm mt-1">Professional Printing Services Cape Town</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;