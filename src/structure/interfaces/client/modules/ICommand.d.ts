export default interface IMsgCommand {
    ignore?: boolean;
    minArgs?: number;
    aliases?: string[]; 
    permissions?: StaffType[]
}
