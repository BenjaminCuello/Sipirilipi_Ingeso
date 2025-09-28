export function Footer() {
    return (
        <footer className="mt-10 border-t-4 border-[#B3E5FC] bg-[#F9FAFB]">
            <div className="w-full max-w-[1400px] mx-auto px-6 py-8 text-sm text-slate-600">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p>© {new Date().getFullYear()} Sipirilipi. Todos los derechos reservados.</p>
                    <nav className="flex items-center gap-4">
                        <a href="#" className="hover:underline">Términos</a>
                        <a href="#" className="hover:underline">Privacidad</a>
                        <a href="#" className="hover:underline">Contacto</a>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
