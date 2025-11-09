import VehicleSwitcher from './VehicleSwitcher'

function Header() {
    return (
        <div id='header' className='absolute top-0 h-15 grid grid-cols-[1fr_auto_1fr] items-stretch w-full border-none z-50 text-stone-900'>
            <div />

            <div className='min-w-0 justify-self-center flex items-center justify-center'>
                <VehicleSwitcher />
            </div>

            <div className='px-5 flex justify-end items-center'>
                {/* Future: Add additional header actions here */}
            </div>
        </div>
    )
}

export default Header
