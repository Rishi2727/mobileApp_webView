import { Icon } from "../ui/custom/icon";

export function Navbar() {

    return (
        <div className="flex justify-between items-center w-full px-4 py-4 bg-muted">
            <div className="flex items-center space-x-0.5">
                <Icon name="Menu" size={20} />
            </div>
            <div className="flex items-center space-x-4">
                <Icon name="Languages" size={20} />
                <Icon name="Home" size={20} />
                <Icon name="Bell" size={20} />
            </div>
        </div>
    )
}
