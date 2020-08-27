export const ConsoleHelper = (data, verbosity) => {
    if (process.env.NODE_ENV === 'production') return;
    if (verbosity === "log")
        console.log(data);
    else if (verbosity === "error")
        console.error(data);
}

export default ConsoleHelper;
