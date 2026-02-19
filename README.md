# Droga na Mecz

Prosty prototyp gry 2D beat'em up inspirowany klasykami arcade.

## Fabuła
Grasz kibicem, który idzie przez miasto na mecz piłkarski. Po drodze spotyka grupy chuliganów, które trzeba ominąć albo pokonać, by dotrzeć do stadionu.

## Sterowanie
- `A` / `D` — ruch lewo/prawo
- `W` — skok
- `Spacja` — cios
- `R` — restart po przegranej/wygranej

## Uruchomienie
Najprościej lokalnym serwerem HTTP:

```bash
python3 -m http.server 4173
```

Następnie otwórz `http://localhost:4173`.

## Co dalej można dodać
- animowane sprite'y postaci,
- pasek staminy i różne typy ciosów,
- boss przed stadionem,
- tryb 2-osobowy lokalnie.
