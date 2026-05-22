rsync -av \
  -e "/usr/bin/ssh" \
  --no-perms \
  ./html/ cbppapps@vps42437.dreamhostps.com:/home/cbppapps/apps.cbpp.org/socsec5-22-26/

rsync -av \
  -e "/usr/bin/ssh" \
  --no-perms \
  ./node/prod/ cbppapps@vps42437.dreamhostps.com:/home/cbppapps/apps.cbpp.org/socsec5-22-26/js/
