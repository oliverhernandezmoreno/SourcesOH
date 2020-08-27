import argparse
import textwrap
import yaml

def parse_args():
    parser = argparse.ArgumentParser(description='Release Docker Images')
    parser.add_argument('--settings', type=argparse.FileType('r'), default='settings.yml')
    parser.add_argument('--manifest', type=argparse.FileType('r'), default='manifest.yml')
    return parser.parse_args()

def parse_settings(settings_file):
    return yaml.safe_load(settings_file)

def parse_manifest(manifest_file):
    return yaml.safe_load(manifest_file)

def compose_image_url(registry, image_path, tag):
    return f'{registry}{image_path}:{tag}'

def format_tag(version, tag_suffix=""):
    return f'v{version.replace(".","-")}{tag_suffix}'

def process_image(image_manifest, image_settings, source_registry, destination_registry):
    version = image_manifest['version']
    source_image = image_settings['source']
    source_tag = format_tag(version)
    destination = image_settings['destination']
    if isinstance(destination, str):
        destination_image = destination
        destination_tag = format_tag(version)
    else:
        destination_image = destination['name']
        destination_tag = format_tag(version, destination['tag_suffix'])

    return { 
        'source': compose_image_url(source_registry, source_image, source_tag), 
        'destination': compose_image_url(destination_registry, destination_image, destination_tag)
    }

def create_plan(manifest, settings):
    plan = dict()
    source_registry = settings['registries']['source']['url']
    destination_registry = settings['registries']['destination']['url']
    for key, image_manifest in manifest.get('images', dict()).items():
        image_settings = settings['images'][key]
        plan[key] = process_image(image_manifest, image_settings, source_registry, destination_registry)
    return plan

def format_cli_script(plan):
    def image_to_docker_cli(key, image):
        return textwrap.dedent(f'''
        # {key}
        docker pull {image['source']}
        docker tag {image['source']} {image['destination']}
        docker push {image['destination']}
        ''')

    script = "#!/bin/bash\n"
    for key, image in plan.items():
        script += f'{image_to_docker_cli(key, image)}'

    return script

def main():
    args = parse_args()
    settings = parse_settings(args.settings)
    manifest = parse_manifest(args.manifest)
    plan = create_plan(manifest, settings)
    print(format_cli_script(plan))

if __name__ == '__main__':
    main()
