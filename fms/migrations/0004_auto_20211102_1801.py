# Generated by Django 3.2.9 on 2021-11-02 18:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fms', '0003_auto_20211102_1759'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='description',
            field=models.CharField(max_length=300),
        ),
        migrations.AlterField(
            model_name='game',
            name='game_name',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='game',
            name='game_short_name',
            field=models.CharField(max_length=30),
        ),
        migrations.AlterField(
            model_name='game',
            name='image_path',
            field=models.CharField(max_length=300),
        ),
    ]
