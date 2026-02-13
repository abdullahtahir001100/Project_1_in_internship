

   import { Menu } from "lucide-react";

export default function Header() {

    return (
        <header className="app-header">
            <div className="flexbox">
                <div className="col">
                    <Menu size={24} />
                    <h1 className="app-title">Admin <span>Dashboard</span></h1>
                </div>
            </div>
            
        </header>
    );
}
