import utils


def test_simple_command():
    utils.command("ls")


def test_command_failure_raises_exception(sandbox):
    try:
        utils.command("ls", sandbox / "non-existent")
    except RuntimeError:
        pass


def test_command_can_interact_with_files(sandbox):
    with open(sandbox / "test-input", "w") as f:
        f.write("FOOBARBAZ")
    utils.command("cat", input=sandbox / "test-input", output=sandbox / "test-output")
    with open(sandbox / "test-output") as f:
        assert f.read() == "FOOBARBAZ"


def test_command_is_given_env_vars_explicitly(sandbox):
    utils.command("printenv", output=sandbox / "test-output", env={
        "PWD": "overwritten",
    })
    with open(sandbox / "test-output") as f:
        kvs = {
            k: v
            for k, v in (
                line.strip().split("=")
                for line in f.readlines()
            )
        }
    # Test for a usually-present, but excluded variable
    assert "USER" not in kvs
    # Test for a usually-present, but overwritten variable
    assert kvs["PWD"] == "overwritten"
