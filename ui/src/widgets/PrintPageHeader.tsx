import Image from "next/image";
const logo = require('../assets/images.png')

export default function PrintPageHeader (){

    return <div className="mb-[20px] pb-[20px] text-center border-b-[2px] border-black">
    <p className="text-[20px] font-bold">Ministère de l'Enseignement Supérieur et Universitaire</p>
    <p>INSTITUT SUPERIEUR PEDAGOGIQUE DE LA GOMBE</p>
    <div className="flex items-center justify-center">
    <Image width={60} height={60} alt="Logo ISP Gombe" src={logo} />
    </div>
    <p>B.P. 3580. TEL : (243) 822358732</p>
    <p className="underline">KINSHASA/GOMBE</p>
</div>
}