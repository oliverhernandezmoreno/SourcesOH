#!/usr/bin/env python
import logging
import os
import signal
import sys
import time
from pathlib import Path

import vlc

logging.basicConfig(format='[%(levelname)s] %(message)s', level=logging.WARNING)
logger = logging.getLogger(__name__)

PROTOCOL = os.environ.get('PROTOCOL', 'rtsp')
HOST = os.environ.get('HOST', '')
PORT = os.environ.get('PORT', '8554')
VIDEOS_DIR = Path(os.environ.get('VIDEOS_DIR', '/videos'))

STREAM_URL = f'{PROTOCOL}://{HOST}:{PORT}/'
TRANSCODE_OPTION = '{vcodec=h264,acodec=mpga,ab=128,channels=2,samplerate=44100}'


def get_signal_handler(player):
    def signal_handler(sig, frame):
        logger.info('Stopping stream')
        player.stop()
        sys.exit(0)

    return signal_handler


if __name__ == '__main__':
    logger.info('Starting fake streaming')
    instance = vlc.Instance("--aout=adummy --no-video --no-audio")
    media_list = instance.media_list_new()

    logger.info('Loading video playlist')
    media_option = f':sout=#transcode{TRANSCODE_OPTION}:gather:rtp{{sdp={STREAM_URL}}}'
    files = list([str(VIDEOS_DIR / f) for f in os.listdir(VIDEOS_DIR) if os.path.isfile(VIDEOS_DIR / f)])
    if len(files) < 1:
        logger.error(f'No files in video folder {VIDEOS_DIR}')
        exit(-1)
    for file in files:
        media = instance.media_new(file, media_option)
        media.parse()
        if media.get_duration() > 0:
            logger.info(f'Adding {file} to playlist')
            media_list.add_media(media)
        else:
            logger.warning(f'Error reading {file}')
    if media_list.count() < 1:
        logger.error(f'No media in playlist')
        exit(-1)

    logger.info(f'Starting playlist')
    player = instance.media_list_player_new()
    player.set_media_list(media_list)
    player.set_playback_mode(vlc.PlaybackMode.loop)
    player.play()

    signal_handler = get_signal_handler(player)
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    while not player.get_state() == vlc.State.Playing:
        time.sleep(5)
    logger.info(f'Stream started on {STREAM_URL}')
    logger.info('Press Ctrl+C to stop it')
    signal.pause()
