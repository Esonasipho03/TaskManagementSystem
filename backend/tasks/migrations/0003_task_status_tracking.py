import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0002_alter_task_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='started_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='task',
            name='completed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name='TaskStatusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('from_status', models.CharField(blank=True, choices=[('TODO', 'To Do'), ('IN_PROGRESS', 'In Progress'), ('REVIEW', 'Review'), ('DONE', 'Done')], max_length=20, null=True)),
                ('to_status', models.CharField(choices=[('TODO', 'To Do'), ('IN_PROGRESS', 'In Progress'), ('REVIEW', 'Review'), ('DONE', 'Done')], max_length=20)),
                ('changed_at', models.DateTimeField(auto_now_add=True)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='tasks.task')),
            ],
            options={
                'ordering': ['changed_at'],
            },
        ),
    ]
