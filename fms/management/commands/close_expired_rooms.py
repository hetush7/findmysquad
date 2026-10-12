from django.core.management.base import BaseCommand

from fms.models import GameSession


class Command(BaseCommand):
    help = "Delete rooms whose time has run out (also happens automatically when rooms are listed or opened)."

    def handle(self, *args, **options):
        deleted, _ = GameSession.close_expired()
        self.stdout.write(f"Closed expired rooms ({deleted} rows deleted).")
