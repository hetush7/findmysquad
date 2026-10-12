from django.db import migrations

# Competitive ranks, lowest first. Admins can edit these per game in the admin panel
# when a game changes its ranked tiers.
DEFAULT_RANKS = {
    'Apex': ['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Apex Predator'],
    'COD': ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crimson', 'Iridescent', 'Top 250'],
    'LoL': ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'],
}


def add_default_ranks(apps, schema_editor):
    Game = apps.get_model('fms', 'Game')
    for game in Game.objects.filter(game_short_name__in=DEFAULT_RANKS.keys()):
        if not game.ranks:
            game.ranks = DEFAULT_RANKS[game.game_short_name]
            game.save(update_fields=['ranks'])


class Migration(migrations.Migration):

    dependencies = [
        ('fms', '0013_rank_ranges'),
    ]

    operations = [
        migrations.RunPython(add_default_ranks, migrations.RunPython.noop),
    ]
