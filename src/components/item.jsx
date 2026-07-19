function Item(props){
    return(
        <>
            <li className="backdrop-blur-sm rounded-2xl p-4 transition-all hover:scale-[1.02] bg-white/9">
                <div className="flex gap-1.5 mb-2 items-center ">
                    <img src={props.image} />
                    <span className="text-xs font-mono text-slate-400">{props.label}</span>
                </div>
                <p className="font-semibold ">{props.value}</p>
            </li>
        </>
    )
}
export default Item