// frontend/src/utils/namingConventions.ts

export const capitalize = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
}


export const toTitleCase = (value: string) => {
    return value
    //   .replace(/[_-]/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());
}
