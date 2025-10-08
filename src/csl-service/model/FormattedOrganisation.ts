export class FormattedOrganisation {
    constructor(
        public id: number,
        public name: string,
        public code: string,
        public abbreviation: string = '',
    ) {}

    getName() {
        const parts = this.name.split("|")
        return parts[parts.length - 1].trim()
    }

    getAbbreviationOrName() {
        let orgNameOrAbbreviation = this.abbreviation
        if (orgNameOrAbbreviation === null || orgNameOrAbbreviation === '') {
            orgNameOrAbbreviation = this.getName()
        }
        return orgNameOrAbbreviation
    }
}
