
export const Status =  {
    Offline: 0,
    Online: 1,
    Away: 2,
    Busy: 3
};

export function StatusToString(status: number){
    switch (status){
        case Status.Offline:
            return "Offline";
        case Status.Online:
            return "Online";
        case Status.Away:
            return "Away";
        case Status.Busy:
            return "Busy";
        default:
            return "Unknown";
    }
}
