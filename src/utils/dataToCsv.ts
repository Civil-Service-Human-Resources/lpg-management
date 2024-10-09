export function getCsvContentFromData(data: {text: string}[][], fields: {name: string, type: string}[]): string{
    
    let csvOutput: string = ""

    csvOutput = data.map((row: {text: string}[]) => {
        return row
            .map((value: {text: string}) => value.text)
            .map((value: string, index: number) => fields[index].type === "text" ? `"${value}"` : value)
            .join(",")
    })
    .join("\n")

    csvOutput = fields
        .map((field: {name: string, type: string}) => field.name)
        .map((field: string) => `"${field}"`).join(",") + "\n" + csvOutput

    return csvOutput
}