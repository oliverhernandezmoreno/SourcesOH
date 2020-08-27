export const ConsoleHelper = (data, verbosity) => {
    if (process.env.NODE_ENV === 'production') return;
    if (verbosity === "log")
        console.log(data);
    else if (verbosity === "error")
        console.error(data);
    else if (verbosity === "info")
        console.info(data);
    else if (verbosity === "warn")
        console.warn(data);
}

export default ConsoleHelper;
