
export const Status =  {
    Offline: 0,
    Online: 1,
    Away: 2,
    Busy: 3
};

export function StatusToString(status: number): string{
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

export function StatusToColorCode(status: number): string{
    switch (status) {
        case 0:
            return 'gray';
        case 1:
            return '#4caf50';
        case 2:
            return 'orange';
        case 3:
            return '#f44336';
        default:
            return "gray";
    }
}
