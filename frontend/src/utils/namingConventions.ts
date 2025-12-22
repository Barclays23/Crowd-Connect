// frontend/src/utils/namingConventions.ts

// eg: "user name" -> "User name"
export const capitalize = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
}


// eg: "this is the title" -> "This Is The Title"
export const toTitleCase = (value: string) => {
    return value
    //   .replace(/[_-]/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());
}



// eg: "John Doe" -> "JD"
export const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};
